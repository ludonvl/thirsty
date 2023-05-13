@extends('layouts.app', [
    'class' => 'login-page',
    'elementActive' => ''
])

@section('content')
<div class="content">
        <div class="container">
            <div class="col-md-8 ml-auto mr-auto">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">Listes des cartes de bar disponibles</h4>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table">
                                <thead class=" text-primary">
                                    <th>
                                        #
                                    </th>
                                    <th>
                                        Utilisateur
                                    </th>
                                    <th class="text-right">
                                    </th>
                                </thead>
                                <tbody>
                                @foreach ($menus as $menu)
                                    <tr>
                                        <td>
                                            {{$menu->id}}
                                        </td>
                                        <td>
                                            {{$menu->user->name}}
                                        </td>
                                        <td class="text-right">
                                            <a href="{{ route('menus', $menu->id) }}">
                                                <i class="nc-icon nc-minimal-right"></i>
                                            </a>
                                        </td>
                                    </tr>
                                @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</div>
@endsection

@push('scripts')
    <script>
        $(document).ready(function() {
            demo.checkFullPageBackgroundImage();
        });
    </script>
@endpush
