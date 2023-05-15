@extends('layouts.app', [
    'class' => '',
    'elementActive' => 'drinks'
])

@section('content')
<div class="content">
    @if (session('status'))
        <div class="alert alert-success" role="alert">
            {{ session('status') }}
        </div>
    @endif

    <!-- Button trigger modal -->
    <button type="button" class="btn btn-default" data-toggle="modal" data-target="#exampleModal">
        Base de cocktails
    </button>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Cocktails disponible</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <select class="form-control" name="template-cocktail" id="template-cocktail" required>
                        @foreach ($cocktails as $cocktail)
                        <option value="{{ $cocktail['name'] }}">{{ $cocktail['name'] }}</option>
                        @endforeach
                    </select>
                    @foreach ($cocktails as $cocktail)
                        <div class="d-none" id="template-cocktail-ingredients-{{ Helper::slugify($cocktail['name']) }}">
                            <div>Ingredients</div>
                            <div class="ingredients">
                            @foreach ($cocktail['ingredients'] as $ingredient)
                                <div>
                                @if(array_key_exists('amount', $ingredient))
                                    <span>{{$ingredient['amount']}}</span>
                                @endif
                                @if(array_key_exists('unit', $ingredient))
                                    <span>{{$ingredient['unit']}}</span>
                                @endif
                                @if(array_key_exists('ingredient', $ingredient))
                                    <span>{{$ingredient['ingredient']}}</span>
                                @endif
                                @if(array_key_exists('special', $ingredient))
                                    <span>{{$ingredient['special']}}</span>
                                @endif
                                </div>
                            @endforeach
                            </div>
                            @if(array_key_exists('preparation', $cocktail))
                                <div>Préparation</div>
                                <div class="preparation">
                                    {{$cocktail['preparation']}}
                                </div>
                            @endif
                        </div>
                    @endforeach
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger btn-round" data-dismiss="modal">Je préfère le mien</button>
                    <button onclick="addCocktail();" type="button" class="btn btn-info btn-round">C'est bon !</button>
                </div>
            </div>
        </div>
    </div> 

    <div class="row">
        <form class="col-md-12" action="{{ route('drink.store') }}" method="POST">
            @csrf
            <div class="card">
                <div class="card-header">
                    <h5 class="title">{{ __('Nouvelle boisson') }}</h5>
                </div>
                <div class="card-body" id="form-drink">
                    <div class="row">
                        <label class="col-md-3 col-form-label">{{ __('Nom de la boisson') }}</label>
                        <div class="col-md-9">
                            <div class="form-group">
                                <input type="text" name="name" class="form-control" placeholder="" required>
                            </div>
                            @if ($errors->has('name'))
                                <span class="invalid-feedback" style="display: block;" role="alert">
                                    <strong>{{ $errors->first('name') }}</strong>
                                </span>
                            @endif
                        </div>
                    </div>
                    <div class="row">
                        <label class="col-md-3 col-form-label" for="drink-group">{{ __('Groupe de boisson') }}</label>
                        <div class="col-md-9">
                            <div class="form-group">
                                <select class="form-control" name="group_id" id="drink-group" required>
                                    @foreach ($groups as $group)
                                    <option value="{{ $group->id }}">{{ $group->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 d-flex align-items-center justify-content-between">
                            <h5>{{ __('Ingredients') }}</h5>
                            <button id="addIngredients" onclick="addIngredient();" type="button" class="btn btn-default btn-fab btn-icon btn-round">
                                <i class="nc-icon nc-simple-add"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="row">
                        <div class="col-md-12 text-center">
                            <button type="submit" class="btn btn-info btn-round">{{ __('Ajouter') }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>
@endsection
@push('scripts')
    <script>
        var e = document.getElementById("template-cocktail");
        var previousCocktail = null;

        const slugify = str =>
            str
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');

        function addCocktail() {
            
        }


        function onSelectCocktail() {
            var value = e.value;
            var text = e.options[e.selectedIndex].text;
            console.log(value, text);

            toggleCocktailIngredients(previousCocktail, false);
            toggleCocktailIngredients(text, true);

            previousCocktail = text;
        }

        function toggleCocktailIngredients(cocktail, show) {
            if (cocktail === null) {
                return ;
            }

            var idIngredient = 'template-cocktail-ingredients-'+slugify(cocktail);
            console.log(idIngredient)
            var elIngredient = document.getElementById(idIngredient);

            if (elIngredient) {
                if (show === true) {
                    elIngredient.classList.remove('d-none');
                    elIngredient.classList.add('d-block');
                } else {
                    elIngredient.classList.remove('d-block');
                    elIngredient.classList.add('d-none');
                }
            }
        }

        e.onchange = onSelectCocktail;
        onSelectCocktail();

        function addIngredient() {
            var client = new XMLHttpRequest();
            client.open('GET', '/html/ingredient.html');
            client.onloadend = function() {
                document.getElementById("form-drink").innerHTML += client.responseText
            }
            client.send();
        }
    </script>
@endpush
